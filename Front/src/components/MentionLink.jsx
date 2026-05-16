import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/MentionLink.css';

function MentionLink({ username, children }) {
    return (
        <Link
            to={`/u/${username}`}
            className="mention-link"
            onClick={(e) => e.stopPropagation()} // ← Чтобы не срабатывал клик по посту
        >
            @{children || username}
        </Link>
    );
}

export default MentionLink;