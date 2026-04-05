import { cn } from "@/lib/utils";

type SocialAvatarProps = {
  username: string;
  avatarUrl?: string;
  className?: string;
  textClassName?: string;
};

const getInitials = (username: string) => {
  const initials = username
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || "?";
};

const SocialAvatar = ({
  username,
  avatarUrl,
  className,
  textClassName,
}: SocialAvatarProps) => {
  return (
    <div
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5ecdb] text-[#4b6349]",
        className,
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${username} avatar`}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className={cn("text-sm font-semibold tracking-[0.04em]", textClassName)}>
          {getInitials(username)}
        </span>
      )}
    </div>
  );
};

export default SocialAvatar;
