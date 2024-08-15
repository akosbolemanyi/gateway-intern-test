import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";

@Schema({
    timestamps: true,
})
export class Movie {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    coverImage: string;

    @Prop({ default: false })
    isWinner: boolean;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);