import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Green Nest početna"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <span className="relative h-14 w-24 sm:w-28">
        <Image
          src="/green-nest-logo-transparent.png"
          alt="Green Nest"
          fill
          priority
          sizes="(max-width: 640px) 96px, 112px"
          className="object-contain"
        />
      </span>
    </Link>
  );
}
