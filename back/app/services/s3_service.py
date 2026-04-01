import boto3
from botocore.client import Config
import os

class S3Service:
    def __init__(self):
        # Данные для входа
        self.key_id = 'minioadmin'
        self.secret_key = 'minioadmin'
        self.bucket = 'sportcenter-bucket'
        self.region = 'us-east-1'

        # 1. Клиент для ВНУТРЕННИХ операций (загрузка/удаление)
        # Он общается с контейнером напрямую по имени 'minio'
        self.s3_internal = boto3.client(
            's3',
            endpoint_url='http://minio:9000',
            aws_access_key_id=self.key_id,
            aws_secret_access_key=self.secret_key,
            config=Config(signature_version='s3v4'),
            region_name=self.region
        )

        # 2. Клиент для ВНЕШНИХ ссылок
        # Он нужен ТОЛЬКО для генерации подписи для 'localhost'
        # Он не делает реальных запросов, поэтому адрес не важен для системы, 
        # но важен для текста ссылки.
        self.s3_external = boto3.client(
            's3',
            endpoint_url='http://localhost:9000', 
            aws_access_key_id=self.key_id,
            aws_secret_access_key=self.secret_key,
            config=Config(signature_version='s3v4'),
            region_name=self.region
        )

    def upload_file(self, file_data, filename, content_type):
        """Используем внутренний клиент"""
        if not content_type.startswith('image/'):
            raise ValueError("Разрешены только изображения")
            
        self.s3_internal.upload_fileobj(
            file_data, 
            self.bucket, 
            filename, 
            ExtraArgs={'ContentType': content_type}
        )
        return filename

    def get_url(self, key):
        """Используем внешний клиент для правильной подписи"""
        if not key: 
            return None
            
        # Генерируем ссылку через клиента, который "думает", что сервер на localhost
        # Подпись будет создана корректно для твоего браузера
        url = self.s3_external.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': key}, 
            ExpiresIn=3600
        )
        return url

    def delete_file(self, key):
        """Используем внутренний клиент"""
        if key:
            try:
                self.s3_internal.delete_object(Bucket=self.bucket, Key=key)
            except Exception as e:
                print(f"Ошибка удаления: {e}")