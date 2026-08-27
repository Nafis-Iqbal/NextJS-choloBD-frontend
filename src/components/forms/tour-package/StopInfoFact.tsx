"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FieldHelpInfo } from "@/components/custom-elements/CustomInputElements";
import { FIELD_LABEL_CLASS, MONEY_TEXT_CLASS, READABLE_BODY_STYLE } from "./constants";
import { formatTaka } from "./utils";

export const CostAmount = ({ amount }: { amount?: number | null }) => {
	if (typeof amount !== "number") return null;
	return (
		<span className={`shrink-0 text-sm ${MONEY_TEXT_CLASS}`}>
			{formatTaka(amount)}
		</span>
	);
};

export const NameWithCost = ({
	name,
	cost,
}: {
	name: string;
	cost?: number | null;
}) => (
	<p
		className="mt-0.5 flex min-w-0 items-baseline justify-between gap-2 text-sm leading-snug"
		style={READABLE_BODY_STYLE}
	>
		<span className="min-w-0 truncate">{name && name.trim() ? name : "Not selected"}</span>
		<CostAmount amount={typeof cost === "number" ? cost : null} />
	</p>
);

export const StopInfoLabel = ({
	icon,
	label,
}: {
	icon?: React.ReactNode;
	label: string;
}) => (
	<div className="flex items-center gap-1.5">
		{icon ? (
			<span className="theme-text-teal shrink-0" aria-hidden="true">
				{icon}
			</span>
		) : null}
		<p className={FIELD_LABEL_CLASS}>{label}</p>
	</div>
);

export const StopInfoFact = ({
	icon,
	label,
	value,
	cost,
	warning,
	children,
}: {
	icon?: React.ReactNode;
	label: string;
	value?: string;
	cost?: number | null;
	warning?: string;
	children?: React.ReactNode;
}) => (
	<div className="min-w-0">
		<div className="flex items-center gap-1.5">
			{icon ? (
				<span className="theme-text-teal shrink-0" aria-hidden="true">
					{icon}
				</span>
			) : null}
			<p className={FIELD_LABEL_CLASS}>{label}</p>
			<AnimatePresence initial={false}>
				{warning && (
					<motion.span
						key={`${label}-warning`}
						initial={{ opacity: 0, scale: 0.85 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.85 }}
					>
						<FieldHelpInfo helpInfo={warning} openOnHover />
					</motion.span>
				)}
			</AnimatePresence>
		</div>
		{children ? (
			<div className="mt-1">{children}</div>
		) : (
			<NameWithCost name={value || ""} cost={value?.trim() ? cost : null} />
		)}
	</div>
);
