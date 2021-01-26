import { Link } from "react-router-dom";

import "./CardArticle.scss";

const CardArticle = ({ 
    desc,
    title,
    url,
}) => (
    <article className="card--article">
        <div className="article--body">
            <div className="body--content">
                <Link to={url} className="content--title">
                    <h3 className="title--text">{title}</h3>
                </Link>
                <div className="content--description">
                    <p>{desc}</p>
                </div>
            </div>
        </div>
    </article>
);

export default CardArticle;
