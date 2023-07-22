import { useParams } from "react-router-dom";
import { TagComponentsWrapper } from "./SearchPage/TagComponentWrapper";
import { useEffect, useState } from "react";

function TagListPage() {

    const { currentURLParameters } = useParams<string>()
    const [namespace,setNamespace] = useState<string>('creator')

    useEffect(() => {

        let parameters = new URLSearchParams(currentURLParameters);
        let parameterNamespace = parameters.getAll('namespace')[0]
        if (parameterNamespace) {
            setNamespace(parameterNamespace)
        }
    },[currentURLParameters])


    return <>
        <TagComponentsWrapper namespace={namespace} fullPage={true} />
    </>
}

export default TagListPage