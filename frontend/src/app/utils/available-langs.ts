export interface LanguageOption {
    code: string;
    label: string;
    flagPath: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
    { code: 'pt', label: 'Português', flagPath: 'br' },
];
