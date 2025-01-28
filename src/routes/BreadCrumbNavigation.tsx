import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './BreadCrumbNavigation.css';

const BreadcrumbNavigation = ({
  currentPage,
  parentPages = [], // Array of {name: string, path: string}
  showHome = true
}) => {
  const navigate = useNavigate();

  return (
    <nav className="breadcrumb-nav">
      {parentPages.map((page, index) => (
        <React.Fragment key={page.path}>
          <Link
            to={page.path}
            className="breadcrumb-link"
          >
            {page.name}
          </Link>
          <ChevronRight className="breadcrumb-chevron" />
        </React.Fragment>
      ))}
      
      {currentPage && (
        <span className="breadcrumb-current">
          {currentPage}
        </span>
      )}
    </nav>
  );
};

export default BreadcrumbNavigation;