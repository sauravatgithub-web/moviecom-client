import React from 'react'
import { Helmet } from 'react-helmet-async'

const Title = ({
    title = "moviecom",
    description = "this is a chat cum bing application"
}) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name = "description" content = {description}/>
        </Helmet>
    )
}

export default Title
