import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import * as compression from "compression";
import * as morgan from "morgan";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global middleware
    app.use(helmet());
    app.use(compression());
    app.use(morgan("dev"));

    // Global pipes
    app.useGlobalPipes(new ValidationPipe());

    // CORS configuration
    app.enableCors({
        credentials: true,
    });

    const port = process.env.PORT || 8080;
    await app.listen(port);
    console.log(`Server is running on port ${port}`);
}
bootstrap();
