"use client";

import React from "react";
import { FaCamera, FaCheck, FaClipboardList, FaEdit, FaPlus, FaQuestionCircle, FaRoute } from "react-icons/fa";
import { PACKAGE_FORM_STEPS, READABLE_MUTED_STYLE, READABLE_SURFACE_STYLE, SECTION_FOCUS_TITLE_CLASS } from "./constants";

export const ghostButtonStyle: React.CSSProperties = {
	backgroundColor: "var(--theme-card-bg)",
	color: "var(--theme-text)",
	border: "1px solid var(--theme-deep-green)",
};

const STEP_ICONS = [FaClipboardList, FaRoute, FaCamera] as const;

export const PackageFormPageHeader = ({
	mode,
	title,
	description,
}: {
	mode: "create" | "edit";
	title: string;
	description: string;
}) => {
	const Icon = mode === "edit" ? FaEdit : FaPlus;
	return (
		<header className="rounded-2xl px-4 py-4 md:px-6 md:py-5" style={READABLE_SURFACE_STYLE}>
			<div className="flex items-start gap-3 md:gap-4">
				<span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl theme-btn-teal">
					<Icon className="h-5 w-5" aria-hidden />
				</span>
				<div className="min-w-0 flex-1">
					<span className="theme-badge inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
						{mode === "edit" ? "Editing" : "Creating"}
					</span>
					<h1 className="mt-2 text-xl font-semibold leading-snug md:text-2xl" style={{ color: "#111827" }}>
						{title}
					</h1>
					<p className="mt-1 text-sm leading-relaxed md:text-base" style={READABLE_MUTED_STYLE}>
						{description}
					</p>
					<ul className="mt-3 flex flex-wrap gap-2">
						{PACKAGE_FORM_STEPS.map((step, index) => {
							const StepIcon = STEP_ICONS[index];
							return (
								<li
									key={step.id}
									className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
									style={{
										backgroundColor: "#F3F4F6",
										color: "#374151",
										border: "1px solid rgba(0, 0, 0, 0.08)",
									}}
								>
									<StepIcon className="h-3 w-3 theme-text-teal" aria-hidden />
									{index + 1}. {step.label}
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		</header>
	);
};

export const FormStepIntro = ({
	title,
	hint,
}: {
	title: string;
	hint: string;
}) => (
	<div className="flex items-start gap-2.5">
		<span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-outline-teal theme-text-teal">
			<FaQuestionCircle className="h-4 w-4" aria-hidden />
		</span>
		<div className="min-w-0">
			<p className={SECTION_FOCUS_TITLE_CLASS}>{title}</p>
			<p className="mt-1 text-sm leading-relaxed" style={READABLE_MUTED_STYLE}>
				{hint}
			</p>
		</div>
	</div>
);

export const PackageFormStepHeader = ({
	stepIndex,
	onStepSelect,
}: {
	stepIndex: number;
	onStepSelect?: (index: number) => void;
}) => (
	<nav
		aria-label="Package form steps"
		className="rounded-2xl px-3 py-5 md:px-6"
		style={READABLE_SURFACE_STYLE}
	>
		<ol className="flex items-start">
			{PACKAGE_FORM_STEPS.map((step, index) => {
				const isCurrent = index === stepIndex;
				const isComplete = index < stepIndex;
				const canSelect = Boolean(onStepSelect) && index <= stepIndex;
				const Icon = STEP_ICONS[index];
				const isLast = index === PACKAGE_FORM_STEPS.length - 1;

				return (
					<li key={step.id} className="relative flex min-w-0 flex-1 flex-col items-center">
						{!isLast ? (
							<span
								className="pointer-events-none absolute left-[calc(50%+1.75rem)] right-[calc(-50%+1.75rem)] top-6 h-0.5"
								style={{
									backgroundColor: isComplete ? "var(--theme-teal)" : "rgba(0, 0, 0, 0.12)",
								}}
								aria-hidden
							/>
						) : null}
						<button
							type="button"
							disabled={!canSelect}
							onClick={() => onStepSelect?.(index)}
							className="relative z-10 flex w-full flex-col items-center gap-2 rounded-lg px-1 py-1 disabled:cursor-default"
							style={{
								backgroundColor: "transparent",
								color: "inherit",
								border: "none",
							}}
							aria-current={isCurrent ? "step" : undefined}
						>
							<span
								className={`relative flex h-12 w-12 items-center justify-center rounded-full ${
									isCurrent || isComplete ? "theme-btn-teal" : ""
								}`}
								style={
									isCurrent || isComplete
										? { color: "#FFFFFF" }
										: {
												backgroundColor: "#F3F4F6",
												color: "#4B5563",
												border: "1px solid rgba(0, 0, 0, 0.12)",
												boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
										  }
								}
							>
								{isComplete ? (
									<FaCheck className="h-5 w-5" aria-hidden />
								) : (
									<Icon className="h-5 w-5" aria-hidden />
								)}
								<span
									className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
									style={{
										backgroundColor: isCurrent || isComplete ? "#111827" : "#6B7280",
										color: "#FFFFFF",
									}}
								>
									{index + 1}
								</span>
							</span>
							<span
								className="text-center text-xs font-semibold leading-snug md:text-sm"
								style={{ color: isCurrent ? "#111827" : "#6B7280" }}
							>
								{step.label}
							</span>
						</button>
					</li>
				);
			})}
		</ol>
	</nav>
);
