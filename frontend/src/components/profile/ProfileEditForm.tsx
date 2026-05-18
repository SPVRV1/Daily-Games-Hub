import { useTheme } from "../../context/ThemeContext";

type ProfileEditFormValues = {
    username: string;
    email: string;
    avatar_url: string;
};

type ProfileEditFormProps = {
    values: ProfileEditFormValues;
    onChange: (values: ProfileEditFormValues) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving?: boolean;
    error?: string | null;
    success?: string | null;
};

export default function ProfileEditForm({
    values,
    onChange,
    onSave,
    onCancel,
    isSaving,
    error,
    success,
}: ProfileEditFormProps) {
    const { isDark } = useTheme();

    return (
        <section
            className={`rounded-2xl border p-5 shadow-sm transition-colors ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}
        >
            <h2 className={`text-[22px] font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                Edit Profile
            </h2>

            {(error || success) && (
                <p
                    className={`mt-3 text-sm ${error
                        ? (isDark ? "text-rose-300" : "text-rose-700")
                        : (isDark ? "text-emerald-300" : "text-emerald-700")}`}
                >
                    {error ?? success}
                </p>
            )}

            <form
                className="mt-4 grid gap-3"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSave();
                }}
            >
                <label className="grid gap-1">
                    <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Username</span>
                    <input
                        value={values.username}
                        onChange={(event) => onChange({ ...values, username: event.target.value })}
                        className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${isDark
                            ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400"}`}
                        placeholder="Your username"
                        autoComplete="username"
                        disabled={Boolean(isSaving)}
                    />
                </label>

                <label className="grid gap-1">
                    <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Email</span>
                    <input
                        value={values.email}
                        onChange={(event) => onChange({ ...values, email: event.target.value })}
                        className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${isDark
                            ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400"}`}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={Boolean(isSaving)}
                    />
                </label>

                <label className="grid gap-1">
                    <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Avatar URL</span>
                    <input
                        value={values.avatar_url}
                        onChange={(event) => onChange({ ...values, avatar_url: event.target.value })}
                        className={`rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${isDark
                            ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:border-slate-500"
                            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400"}`}
                        placeholder="https://..."
                        inputMode="url"
                        disabled={Boolean(isSaving)}
                    />
                </label>

                <div className="mt-2 flex flex-wrap gap-2">
                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={Boolean(isSaving)}
                    >
                        {isSaving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                        type="button"
                        className={`rounded-lg border px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${isDark
                            ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                        onClick={onCancel}
                        disabled={Boolean(isSaving)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>
    );
}
