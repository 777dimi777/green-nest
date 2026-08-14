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
      <span className="relative h-12 w-24 overflow-hidden sm:w-32">
        <Image
          src="/green-nest-logo.png"
          alt="Green Nest"
          fill
          priority
          sizes="(max-width: 640px) 96px, 128px"
          className="scale-[1.45] object-contain"
        />
      </span>
    </Link>
  );
}
