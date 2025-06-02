import withAuth from "@/routes/withAuth";
import BreadcrumbNavigation from "@/layout/BreadCrumbNavigation";
import LibraryContent from "./LibraryContent"; // Component for the existing library content

const Library = () => {
  const parentPages = [] as Array<{ name: string; path: string }>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between w-full border-b border-typo-200 px-6 py-2 min-h-14">
        <BreadcrumbNavigation
          currentPage="Content Library"
          parentPages={parentPages}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <LibraryContent />
      </div>
    </div>
  );
};

export default withAuth(Library);
