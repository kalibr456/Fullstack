import boto3
from botocore.client import Config
from flask import current_app

class S3Service:
    def __init__(self):
        # Все переменные, начинающиеся с self., должны быть внутри методов
        self.s3 = boto3.client(
            's3',
            endpoint_url='http://127.0.0.1:9000',  # API порт MinIO
            aws_access_key_id='minioadmin',
            aws_secret_access_key='minioadmin',
            config=Config(signature_version='s3v4'),
            region_name='us-east-1'
        )
        self.bucket = 'sportcenter-bucket'

    def upload_file(self, file_data, filename, content_type):
        """Загрузка файла с ограничением типа (Пункт 5.4)"""
        if not content_type.startswith('image/'):
            raise ValueError("Разрешены только изображения")
            
        self.s3.upload_fileobj(
            file_data, 
            self.bucket, 
            filename, 
            ExtraArgs={'ContentType': content_type}
        )
        return filename

    def get_url(self, key):
        """Генерация защищенной временной ссылки (Пункт 5.2)"""
        if not key: 
            return None
        return self.s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': key}, 
            ExpiresIn=3600  # Ссылка живет 1 час
        )

    def delete_file(self, key):
        """Удаление из облака (Пункт 5.3)"""
        if key:
            try:
                self.s3.delete_object(Bucket=self.bucket, Key=key)
            except Exception as e:
                print(f"Ошибка при удалении файла из S3: {e}")