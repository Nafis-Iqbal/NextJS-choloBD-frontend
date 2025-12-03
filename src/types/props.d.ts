export{}

declare global{
    interface BasicButtonProps<T>
    {
        buttonText: string;
        buttonColor: string;
        textColor?: string;
        onClick: (value?: T | undefined) => void;
        customStyle?: string;
        children?: React.ReactNode;
        value?: T;
    }

    interface CreateCategoryModalProps
    {
        isOpen: boolean;
        onClose: () => void;
        onSubmit: () => void;
        onSuccess: (data: Category) => void;
        onFailure: () => void;
    }

    interface EditUserInfoModalProps
    {
        isOpen: boolean;
        defaultUserInfo: User;
        onClose: () => void;
        onSubmit: () => void;
        onSuccess: (data: User) => void;
        onFailure: () => void;
    }
}