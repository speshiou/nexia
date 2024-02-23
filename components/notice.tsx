import { HTMLAttributes } from "react";

export default function Notice({
    children,
    leading,
    className
}: Readonly<HTMLAttributes<HTMLDivElement> & {
    leading?: React.ReactNode,
}>) {
    return (
        <div className={`${className} flex text-orange-400 gap-4 border border-orange-400 rounded-md p-2 text-left`}>
            {leading && leading}
            <p className="flex-1">{children}</p>
        </div>
    );
}