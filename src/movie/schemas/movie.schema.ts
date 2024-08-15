import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Factory} from "nestjs-seeder";

export type MovieDocument = Movie & Document;

@Schema({
    timestamps: true,
})
export class Movie {
    @Factory(faker => faker.lorem.words(2))
    @Prop({ required: true })
    title: string;

    @Factory(faker => faker.lorem.words(10))
    @Prop({ default: "" })
    description: string;

    @Factory(faker => faker.image.url())
    @Prop({ default: "" })
    coverImage: string;

    @Factory(faker => faker.color.human() === 'red')
    @Prop({ default: false })
    isWinner: boolean;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);