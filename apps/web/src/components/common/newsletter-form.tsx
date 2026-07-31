"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewsletterForm() {
  return (
    <form
      className="mt-7 flex max-w-lg flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        toast.info("Newsletter prijava biće dostupna uskoro.");
      }}
    >
      <div className="flex-1">
        <Label htmlFor="newsletter-email" className="sr-only">
          Email adresa
        </Label>
        <Input
          id="newsletter-email"
          type="email"
          required
          placeholder="vaš@email.rs"
          className="bg-card"
        />
      </div>
      <Button type="submit" size="lg">
        Obavesti me
      </Button>
    </form>
  );
}
