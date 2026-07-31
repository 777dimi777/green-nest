"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { formatDate } from "@/lib/utils/date";
import {
  useDeleteReview,
  useMyReview,
  useProductReviews,
} from "../hooks/use-reviews";
import { ReviewForm } from "./review-form";
import { StarRating } from "./star-rating";

export function ProductReviewsSection({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const { user, isAuthenticated } = useAuth(),
    reviews = useProductReviews(productId),
    mine = useMyReview(productId),
    remove = useDeleteReview(productId),
    [editing, setEditing] = useState(false);
  if (reviews.isPending)
    return (
      <section className="mt-16">
        <Skeleton className="h-48" />
      </section>
    );
  if (reviews.isError)
    return (
      <section className="mt-16">
        <ErrorState
          title="Recenzije nisu dostupne"
          description={getApiErrorMessage(reviews.error)}
          onRetry={() => void reviews.refetch()}
        />
      </section>
    );
  const own = mine.data?.review;
  return (
    <section className="mt-16 border-t pt-12" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="reviews-heading"
            className="font-serif text-4xl font-semibold"
          >
            Recenzije kupaca
          </h2>
          <p className="mt-2 text-muted-foreground">
            {reviews.data.summary.totalReviews} recenzija
            {reviews.data.summary.totalReviews > 0 &&
              ` · prosečna ocena ${reviews.data.summary.averageRating.toFixed(1)}`}
          </p>
        </div>
        {reviews.data.summary.totalReviews > 0 && (
          <StarRating
            readOnly
            value={Math.round(reviews.data.summary.averageRating)}
          />
        )}
      </div>
      {!isAuthenticated ? (
        <p className="mt-6">
          <Link
            className="font-medium text-primary hover:underline"
            href={`/auth/login?redirect=${encodeURIComponent(`/prodavnica/${productSlug}`)}`}
          >
            Prijavite se da napišete recenziju.
          </Link>
        </p>
      ) : mine.isPending ? (
        <Skeleton className="mt-6 h-24" />
      ) : own ? (
        editing ? (
          <ReviewForm
            productId={productId}
            review={own}
            onDone={() => setEditing(false)}
          />
        ) : (
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => setEditing(true)}>
              Izmeni svoju recenziju
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm("Da li želite da obrišete recenziju?"))
                  remove.mutate(own.id);
              }}
            >
              Obriši svoju recenziju
            </Button>
          </div>
        )
      ) : (
        <ReviewForm productId={productId} />
      )}
      <div className="mt-10 space-y-4">
        {reviews.data.data.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            Još nema recenzija.
          </p>
        ) : (
          reviews.data.data.map((review) => (
            <article key={review.id} className="rounded-xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <strong>
                    {review.user.firstName} {review.user.lastName}
                  </strong>
                  {review.user.id === user?.id && (
                    <span className="ml-2 rounded-full bg-secondary px-2 py-1 text-xs">
                      Vaša recenzija
                    </span>
                  )}
                </div>
                <time className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt)}
                </time>
              </div>
              <StarRating readOnly value={review.rating} />
              {review.title && (
                <h3 className="mt-3 font-semibold">{review.title}</h3>
              )}
              <p className="mt-2 whitespace-pre-line text-muted-foreground">
                {review.comment}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
