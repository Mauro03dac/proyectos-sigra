import { usePage } from '@inertiajs/react';

type FormularioHeaderBadge = {
    label: string;
    tone?: 'accent' | 'muted';
};

type FormularioHeaderProps = {
    title: string;
    description?: string;
    greeting?: string;
    badges?: FormularioHeaderBadge[];
};

const badgeClassNames: Record<
    NonNullable<FormularioHeaderBadge['tone']>,
    string
> = {
    accent: 'inline-flex min-h-9 items-center rounded-full bg-[#FFC933] px-[15px] text-[15px] font-extrabold text-[#3A2A00]',
    muted: 'inline-flex min-h-9 items-center rounded-full bg-white/16 px-[14px] text-[15px] font-bold',
};

export function FormularioHeader({
    title,
    description,
    greeting = 'Hola, Mauricio',
    badges = [],
}: FormularioHeaderProps) {
    const { auth } = usePage().props;
    const greetingText = greeting ?? `Hola, ${auth.user?.name ?? 'Mauricio'}`;

    return (
        <section className="relative min-h-[290px] overflow-hidden rounded-[34px] bg-[#0F5A3C] px-6 py-11 text-white shadow-[0_7px_0_#0A3A27,0_24px_34px_-20px_rgba(14,59,42,0.8)] sm:px-12 sm:pb-12">
            <svg
                className="pointer-events-none absolute right-0 bottom-0 hidden h-full w-[62%] sm:block"
                viewBox="0 0 640 300"
                preserveAspectRatio="xMaxYMax slice"
                aria-hidden="true"
            >
                <circle
                    cx="500"
                    cy="72"
                    r="58"
                    fill="#FFC933"
                    fillOpacity=".22"
                />
                <circle cx="500" cy="72" r="38" fill="#FFC933" />
                <g fill="#E9F6E4" opacity=".92">
                    <ellipse cx="330" cy="70" rx="36" ry="12" />
                    <ellipse cx="354" cy="58" rx="22" ry="14" />
                    <ellipse cx="308" cy="62" rx="18" ry="10" />
                    <ellipse cx="590" cy="128" rx="26" ry="9" />
                    <ellipse cx="606" cy="119" rx="15" ry="10" />
                </g>
                <path
                    d="M236 74q8-8 16 0M258 56q7-7 14 0M276 80q6-6 12 0"
                    fill="none"
                    stroke="#E9F6E4"
                    strokeLinecap="round"
                    strokeWidth="2.6"
                />
                <path
                    d="M0 300V172Q140 112 290 162T640 132V300Z"
                    fill="#1B7A45"
                />
                <path
                    d="M0 300V218Q170 162 330 208T640 188V300Z"
                    fill="#2FA057"
                />
                <path
                    d="M0 300V264Q200 220 400 257T640 242V300Z"
                    fill="#8BD15E"
                />
                <g
                    fill="none"
                    stroke="#5FAF3C"
                    strokeLinecap="round"
                    strokeWidth="3"
                >
                    <path d="M150 292Q290 248 450 282" />
                    <path d="M110 284Q270 238 440 272" />
                    <path d="M200 298Q320 262 470 292" />
                </g>
                <rect x="378" y="184" width="6" height="28" fill="#0B3B26" />
                <circle cx="381" cy="174" r="18" fill="#0B4A2F" />
                <circle cx="368" cy="186" r="12" fill="#0B4A2F" />
                <circle cx="394" cy="186" r="12" fill="#0B4A2F" />
                <rect x="420" y="170" width="64" height="46" fill="#E0573F" />
                <path d="M412 172L452 140L492 172Z" fill="#A63A27" />
                <rect x="440" y="186" width="24" height="30" fill="#FFE9B8" />
                <path
                    d="M440 186l24 30M464 186l-24 30"
                    stroke="#A63A27"
                    strokeWidth="2.5"
                />
                <rect x="556" y="186" width="5" height="22" fill="#0B3B26" />
                <circle cx="558" cy="178" r="14" fill="#0B4A2F" />
                <circle cx="548" cy="188" r="9" fill="#0B4A2F" />
                <circle cx="568" cy="188" r="9" fill="#0B4A2F" />
            </svg>
            <div className="relative flex max-w-[600px] flex-col items-start gap-4">
                <p className="text-[16px] font-bold text-[#C8EA6B]">
                    {greetingText}
                </p>
                <h1 className="text-[28px] leading-[1.12] font-extrabold tracking-[-0.03em]">
                    {title}
                </h1>
                {description && (
                    <p className="max-w-[460px] text-[16px] leading-[1.5] text-[#DDF0DF]">
                        {description}
                    </p>
                )}
                {badges.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                        {badges.map((badge) => (
                            <span
                                key={badge.label}
                                className={
                                    badgeClassNames[badge.tone ?? 'muted']
                                }
                            >
                                {badge.label}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
