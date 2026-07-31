"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Review } from "@/types/review";
import { useCreateReview, useUpdateReview } from "../hooks/use-reviews";
import { StarRating } from "./star-rating";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().max(1000).min(1, "Unesite komentar."),
});
type Values = z.infer<typeof schema>;
export function ReviewForm({
  productId,
  review,
  onDone,
}: {
  productId: string;
  review?: Review;
  onDone?: () => void;
}) {
  const create = useCreateReview(productId),
    update = useUpdateReview(productId, review?.id ?? "");
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: review?.rating ?? 5,
      title: review?.title ?? "",
      comment: review?.comment ?? "",
    },
  });
  const rating = useWatch({ control, name: "rating" });
  const pending = create.isPending || update.isPending;
  return (
    <form
      className="mt-6 max-w-2xl space-y-4 rounded-xl border p-5"
      onSubmit={handleSubmit((values) => {
        const mutation = review ? update : create;
        mutation.mutate(values, { onSuccess: onDone });
      })}
    >
      <div>
        <Label>Ocena</Label>
        <StarRating
          value={rating}
          onChange={(value) =>
            setValue("rating", value, { shouldValidate: true })
          }
        />
        {errors.rating && (
          <p className="text-sm text-destructive">{errors.rating.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="review-title">Naslov (opciono)</Label>
        <Input id="review-title" maxLength={100} {...register("title")} />
      </div>
      <div>
        <Label htmlFor="review-comment">Komentar</Label>
        <textarea
          id="review-comment"
          rows={5}
          maxLength={1000}
          className="mt-2 w-full rounded-md border bg-background p-3 text-sm"
          {...register("comment")}
        />
        {errors.comment && (
          <p className="text-sm text-destructive">{errors.comment.message}</p>
        )}
      </div>
      <Button disabled={pending}>
        {pending ? "Čuvanje…" : review ? "Sačuvaj izmene" : "Objavi recenziju"}
      </Button>
    </form>
  );
}
