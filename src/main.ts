import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { EMAIL_QUEUE } from './consts'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Versionamento
  app.enableVersioning({
    type: VersioningType.URI,
  })

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Curso NestJS - Tasks API')
    .setDescription('API desenvolvida durante o curso de NestJS - Monaro Dev')
    .setVersion('1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'jwt',
    )
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  // Habilitando Micro-serviços
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL!],
      queue: EMAIL_QUEUE,
      queueOptions: { durable: true },
    },
  })

  await app.startAllMicroservices()

  // CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })

  // Validações
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
