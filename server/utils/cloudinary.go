package utils

import (
	"context"
	"mime/multipart"
	"server/config"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

func UploadToCloudinary(file multipart.File, fileHeader *multipart.FileHeader) (string, string, error) {
	cld, err := cloudinary.NewFromParams(
		config.GetEnv("CLOUD_NAME"),
		config.GetEnv("CLOUD_API_KEY"),
		config.GetEnv("CLOUD_API_SECRET"),
	)
	if err != nil {
		return "", "", err
	}

	ctx := context.Background()

	uploadResult, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: "products",
	})

	if err != nil {
		return "", "", err
	}

	return uploadResult.SecureURL, uploadResult.PublicID, nil
}

func DeleteFromCloudinary(publicID string) error {
	cld, _ := cloudinary.NewFromParams(
		config.GetEnv("CLOUD_NAME"),
		config.GetEnv("CLOUD_API_KEY"),
		config.GetEnv("CLOUD_API_SECRET"),
	)

	ctx := context.Background()

	_, err := cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})

	return err
}
