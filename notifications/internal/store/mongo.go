package store

import (
	"context"
	"errors"
	"time"

	"github.com/GabrielGodoi987/flashticket/notifications/internal/notification"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	Ping(context.Context) error
	EnsureIndexes(context.Context) error
	InsertEvent(context.Context, notification.Event) (notification.Notification, bool, error)
	ListByRecipient(context.Context, string, int64) ([]notification.Notification, error)
	MarkRead(context.Context, string, string) (bool, error)
	PendingEmail(context.Context, int64) ([]notification.Notification, error)
	ClaimEmail(context.Context, string, time.Time) (bool, error)
	MarkEmail(context.Context, string, string) error
}

type MongoRepository struct {
	collection *mongo.Collection
}

func NewMongoRepository(database *mongo.Database) *MongoRepository {
	return &MongoRepository{collection: database.Collection("notifications")}
}

func (repository *MongoRepository) Ping(ctx context.Context) error {
	return repository.collection.Database().Client().Ping(ctx, nil)
}

func (repository *MongoRepository) EnsureIndexes(ctx context.Context) error {
	_, err := repository.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "eventId", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("uq_notifications_event_id"),
		},
		{
			Keys:    bson.D{{Key: "recipientId", Value: 1}, {Key: "createdAt", Value: -1}},
			Options: options.Index().SetName("ix_notifications_recipient_created"),
		},
		{
			Keys:    bson.D{{Key: "emailStatus", Value: 1}, {Key: "emailAttemptAt", Value: 1}},
			Options: options.Index().SetName("ix_notifications_email_retry"),
		},
	})
	return err
}

func (repository *MongoRepository) InsertEvent(ctx context.Context, event notification.Event) (notification.Notification, bool, error) {
	record := notification.New(event, time.Now().UTC())
	_, err := repository.collection.InsertOne(ctx, record)
	if err == nil {
		return record, true, nil
	}
	if !mongo.IsDuplicateKeyError(err) {
		return notification.Notification{}, false, err
	}
	err = repository.collection.FindOne(ctx, bson.M{"eventId": event.EventID}).Decode(&record)
	return record, false, err
}

func (repository *MongoRepository) ListByRecipient(ctx context.Context, recipientID string, limit int64) ([]notification.Notification, error) {
	cursor, err := repository.collection.Find(ctx, bson.M{"recipientId": recipientID}, options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}}).
		SetLimit(limit))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var records []notification.Notification
	if err := cursor.All(ctx, &records); err != nil {
		return nil, err
	}
	if records == nil {
		records = []notification.Notification{}
	}
	return records, nil
}

func (repository *MongoRepository) MarkRead(ctx context.Context, id, recipientID string) (bool, error) {
	objectID, err := parseObjectID(id)
	if err != nil {
		return false, nil
	}
	now := time.Now().UTC()
	result, err := repository.collection.UpdateOne(ctx,
		bson.M{"_id": objectID, "recipientId": recipientID, "readAt": bson.M{"$exists": false}},
		bson.M{"$set": bson.M{"readAt": now}},
	)
	if err != nil {
		return false, err
	}
	if result.ModifiedCount == 1 {
		return true, nil
	}
	var existing bson.M
	err = repository.collection.FindOne(ctx, bson.M{"_id": objectID, "recipientId": recipientID}).Decode(&existing)
	return err == nil, err
}

func (repository *MongoRepository) PendingEmail(ctx context.Context, limit int64) ([]notification.Notification, error) {
	cutoff := time.Now().UTC().Add(-5 * time.Minute)
	cursor, err := repository.collection.Find(ctx, bson.M{
		"sendEmail": true,
		"$or": []bson.M{
			{"emailStatus": "pending"},
			{"emailStatus": "sending", "emailAttemptAt": bson.M{"$lt": cutoff}},
		},
	}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: 1}}).SetLimit(limit))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	var records []notification.Notification
	if err := cursor.All(ctx, &records); err != nil {
		return nil, err
	}
	return records, nil
}

func (repository *MongoRepository) ClaimEmail(ctx context.Context, eventID string, now time.Time) (bool, error) {
	cutoff := now.Add(-5 * time.Minute)
	filter := bson.M{
		"eventId":   eventID,
		"sendEmail": true,
		"$or": []bson.M{
			{"emailStatus": "pending"},
			{"emailStatus": "sending", "emailAttemptAt": bson.M{"$lt": cutoff}},
		},
	}
	result := repository.collection.FindOneAndUpdate(
		ctx,
		filter,
		bson.M{"$set": bson.M{"emailStatus": "sending", "emailAttemptAt": now}},
	)
	if errors.Is(result.Err(), mongo.ErrNoDocuments) {
		return false, nil
	}
	return result.Err() == nil, result.Err()
}

func (repository *MongoRepository) MarkEmail(ctx context.Context, eventID, status string) error {
	_, err := repository.collection.UpdateOne(
		ctx,
		bson.M{"eventId": eventID},
		bson.M{"$set": bson.M{"emailStatus": status}},
	)
	return err
}

func parseObjectID(id string) (primitive.ObjectID, error) {
	return primitive.ObjectIDFromHex(id)
}
