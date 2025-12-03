import { IconType } from "react-icons";

type IconWithBadgeProps = {
  Icon: IconType;
  badgeValue?: number | string;
  iconClassName?: string;
  badgeClassName?: string;
};

export default function IconWithBadge({
  Icon,
  badgeValue,
  iconClassName = "text-2xl text-gray-700",
  badgeClassName = "",
}: IconWithBadgeProps) {
  return (
    <div className="relative inline-block w-fit bg-inherit">
      <Icon className={iconClassName} />
      {badgeValue != null && badgeValue !== "" && badgeValue !== 0 && (
        <span
          className={`absolute -bottom-2 -right-3 text-[12px] bg-red-500 text-white rounded-full px-[5px] py-[1px] leading-none ${badgeClassName}`}
        >
          {badgeValue}
        </span>
      )}
    </div>
  );
}
