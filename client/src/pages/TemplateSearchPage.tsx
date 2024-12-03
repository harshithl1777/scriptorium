import { TemplatesTable } from "@/containers/TemplateSearchTable";
import { useSite } from "@/lib/SiteProvider";
import { useEffect } from "react";

const TemplateSerchPage = () => {
  const { updateBreadcrumbs } = useSite();

  useEffect(() => {
    updateBreadcrumbs([{ label: "TemplateSearch", path: "" }]);
  }, []);
  return (
    <div className="ml-8 mr-8 space-y-6">
      <TemplatesTable />
    </div>
  );
};

export default TemplateSerchPage;
