// src/services/MinioService.js
import { Client } from 'minio';

class MinioService {
  constructor() {
    this.minioClient = new Client({
      endPoint: 'your-server.com',
      port: 9000,
      useSSL: true,
      accessKey: process.env.REACT_APP_MINIO_ACCESS_KEY,
      secretKey: process.env.REACT_APP_MINIO_SECRET_KEY
    });

    this.buckets = {
      fragments: 'fragments',
      properties: 'properties',
      geodata: 'geodata'
    };
  }

  async uploadModelFiles(plantId, files) {
    try {
      // Upload .frag file
      const fragName = `${plantId}/${files.geometry.name}`;
      await this.minioClient.putObject(
        this.buckets.fragments,
        fragName,
        files.geometry
      );

      // Upload .json file
      const jsonName = `${plantId}/${files.properties.name}`;
      await this.minioClient.putObject(
        this.buckets.properties,
        jsonName,
        files.properties
      );

      return {
        geometry: await this.getFileUrl(this.buckets.fragments, fragName),
        properties: await this.getFileUrl(this.buckets.properties, jsonName)
      };
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  async getFileUrl(bucket, fileName) {
    return await this.minioClient.presignedGetObject(bucket, fileName, 24*60*60); // URL valido 24h
  }
}

export const minioService = new MinioService();