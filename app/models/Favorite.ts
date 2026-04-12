import mongoose, { Schema, Document, Model } from "mongoose";

// Interface TypeScript pour le typage
export interface IFavorite extends Document {
  tmdbId: number;
  title: string;
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  addedAt: Date;
}

// Schéma Mongoose
const FavoriteSchema = new Schema<IFavorite>(
  {
    tmdbId: {
      type: Number,
      required: [true, "tmdbId est obligatoire"],
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Le titre est obligatoire"],
      trim: true,
      maxlength: [200, "Le titre ne peut dépasser 200 caractères"],
    },
    posterPath: {
      type: String,
      default: "",
    },
    overview: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: String,
      default: "",
    },
    voteAverage: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Ajoute automatiquement createdAt et updatedAt
    timestamps: true,
  },
);

// Évite la re-création du modèle lors des rechargements HMR
const Favorite: Model<IFavorite> =
  mongoose.models.Favorite ||
  mongoose.model<IFavorite>("Favorite", FavoriteSchema);

export default Favorite;
