import { useEffect, useRef, useState } from "react";
import { Div, Input } from "./components/UI";
import { Select } from "./components/Select";
import { Button } from "./components/Button";
import { wait } from "./utils/helpers";

export function ModelSelector({ value, onChange, loader, abort }) {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingError, setLoadingError] = useState(null);
    const selectModelsRef = useRef(null);

    useEffect(() => {
        setModels([]);
        setLoadingError(null);
    }, [abort]);

    async function fetchModels() {
        selectModelsRef.current.focus();
        setLoadingError(null);
        if (loading) return;
        setLoading(true);

        await wait(200);

        try {
            const list = await loader();
            setModels(list);
        } catch (error) {
            setModels([]);
            setLoadingError(error.message);
            console.error("Error loading models:", error);
        } finally {
            setLoading(false);
        }
    }

    function fetchModelsCancel() {
        abort && abort();
    }

    return (
        <div className="">
            <div className="p-2 flex justify-between">
                <div className="">
                    Model Name
                </div>
                <Div className="flex gap-2" hidden={!abort} >
                    <Button hidden={loading} onClick={fetchModels}>
                        reload
                    </Button>
                    <Button hidden={!loading} onClick={fetchModelsCancel}>
                        cancel
                    </Button>
                </Div>
            </div>

            <Input
                hidden={loader && abort}
                value={value}
                onChange={(e) => { onChange(e.target.value) }} />

            <Select
                ref={selectModelsRef}
                loading={loading}
                error={loadingError}
                hidden={!abort}
                value={value}
                onChange={onChange}
                options={models.map((model) => model.name)} />
        </div>
    );
}
