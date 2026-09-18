import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Pro Graft početna"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      <span className="relative h-14 w-24 sm:w-28">
        <Image
          src="/pro-graft-logo.png"
          alt="Pro Graft"
          fill
          priority
          sizes="(max-width: 640px) 96px, 112px"
          className="object-contain"
        />
      </span>
    </Link>
  );
}
