"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight, FaSave, FaTimes } from "react-icons/fa";
import { FieldHelpInfo } from "@/components/custom-elements/CustomInputElements";
import { READABLE_SURFACE_STYLE } from "./constants";
import { ghostButtonStyle } from "./PackageFormStepHeader";

export const disabledPrimaryButtonStyle: React.CSSProperties = {
	backgroundColor: "var(--theme-text-subtle)",
	color: "white",
	border: "1px solid var(--theme-text-subtle)",
	cursor: "not-allowed",
};

const footerButtonClass =
	"inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm";

export const FormNavFooter = ({
	formStep,
	continueDisabled,
	continueDisabledReason,
	canSave,
	saveLabel,
	onBack,
	onContinue,
	onCancel,
}: {
	formStep: number;
	continueDisabled: boolean;
	continueDisabledReason: string | null;
	canSave: boolean;
	saveLabel: string;
	onBack: () => void;
	onContinue: () => void;
	onCancel: () => void;
}) => {
	const continueButton = (
		<motion.button
			key="form-continue"
			type="button"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={`${footerButtonClass} ${
				continueDisabled ? "cursor-not-allowed" : "theme-btn-teal"
			}`}
			style={continueDisabled ? disabledPrimaryButtonStyle : undefined}
			disabled={continueDisabled}
			onClick={onContinue}
		>
			Continue
			<FaArrowRight className="h-3.5 w-3.5" aria-hidden />
		</motion.button>
	);

	const saveButton = (
		<button
			type="submit"
			className={`${footerButtonClass} ${
				canSave ? "theme-btn-teal" : "cursor-not-allowed"
			}`}
			style={canSave ? undefined : disabledPrimaryButtonStyle}
			disabled={!canSave}
		>
			<FaSave className="h-3.5 w-3.5" aria-hidden />
			{saveLabel}
		</button>
	);

	return (
		<div
			className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 md:px-5 md:py-4"
			style={{
				...READABLE_SURFACE_STYLE,
				boxShadow: "0 8px 24px rgba(0, 0, 0, 0.14)",
			}}
		>
			<div className="flex flex-wrap items-center gap-2.5">
				<AnimatePresence initial={false}>
					{formStep > 0 && (
						<motion.button
							key="form-back"
							type="button"
							initial={{ opacity: 0, x: -8 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -8 }}
							className={footerButtonClass}
							style={ghostButtonStyle}
							onClick={onBack}
						>
							<FaArrowLeft className="h-3.5 w-3.5" aria-hidden />
							Back
						</motion.button>
					)}
				</AnimatePresence>
				<AnimatePresence mode="wait" initial={false}>
					{formStep < 2 ? (
						continueDisabled && continueDisabledReason ? (
							<FieldHelpInfo key="form-continue-help" helpInfo={continueDisabledReason} openOnHover>
								{continueButton}
							</FieldHelpInfo>
						) : (
							continueButton
						)
					) : (
						<motion.div
							key="form-save"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="flex flex-wrap items-center gap-2.5"
						>
							{!canSave && continueDisabledReason ? (
								<FieldHelpInfo helpInfo={continueDisabledReason} openOnHover>
									{saveButton}
								</FieldHelpInfo>
							) : (
								saveButton
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<button
				type="button"
				className={`${footerButtonClass} transition-colors hover:!bg-[#DC2626] hover:!text-white hover:!border-[#DC2626]`}
				style={ghostButtonStyle}
				onClick={onCancel}
			>
				<FaTimes className="h-3.5 w-3.5" aria-hidden />
				Cancel
			</button>
		</div>
	);
};
