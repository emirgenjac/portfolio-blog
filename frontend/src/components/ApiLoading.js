import { useEffect, useState } from "react";
import "../styles/ApiLoading.css";

function ApiLoading({ title }) {
    const [slow, setSlow] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setSlow(true), 8000);
        return () => window.clearTimeout(timer);
    }, []);

    return (
        <div className="api-loading" role="status" aria-live="polite">
            {title ? <h1 className="api-loading-title">{title}</h1> : null}
            <div className="api-loading-body">
                <div className="api-loading-spinner" aria-hidden="true" />
                <p>
                    {slow
                        ? "Still starting the server — free hosting can take up to a minute."
                        : "Loading…"}
                </p>
            </div>
        </div>
    );
}

export default ApiLoading;
