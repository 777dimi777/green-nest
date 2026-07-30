import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";
import type { ProductReview } from "@/types/product";

export function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  return (
    <section className="mt-16 border-t pt-12" aria-labelledby="reviews-title">
      <h2 id="reviews-title" className="font-serif text-4xl font-semibold">
        Utisci kupaca
      </h2>
      {reviews.length === 0 ? (
        <p className="mt-4 text-muted-foreground">
          Ovaj proizvod još nema objavljenih recenzija.
        </p>
      ) : (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div
                className="flex gap-1 text-amber-600"
                aria-label={`Ocena ${review.rating} od 5`}
              >
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className="size-4"
                    fill={index < review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
              {review.title && (
                <h3 className="mt-4 font-semibold">{review.title}</h3>
              )}
              {review.comment && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {review.comment}
                </p>
              )}
              <p className="mt-5 text-xs text-muted-foreground">
                {review.user.firstName} {review.user.lastName} ·{" "}
                {formatDate(review.createdAt)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
