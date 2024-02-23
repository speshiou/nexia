import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Notice from "./notice";

export default function Disclaimer() {
    const icon = <ExclamationCircleIcon className="w-6 h-6"/>
    const text = "Our service may inadvertently generate harmful content, so please use it with caution. Users must be at least 18 years old and are responsible for refraining from sharing sexual, violent, or reputation-damaging material."
    return (
        <Notice className="mt-8" leading={icon}>
            {text}
        </Notice>
    );
}