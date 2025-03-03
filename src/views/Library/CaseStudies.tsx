import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Search, Plus, FileText } from "lucide-react";
import { useAuthUser } from "react-auth-kit";
import { API_URL, HTTP_PREFIX } from "../../helper/Constants.tsx";
import axios from "axios";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge.tsx";

const CaseStudies = () => {
  const getAuth = useAuthUser();
  const auth = getAuth();
  const tokenRef = useRef(auth?.token || "default");

  const [caseStudies, setCaseStudies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API endpoint for case studies
      const response = await axios.get(
        `http${HTTP_PREFIX}://${API_URL}/get_case_studies`,
        {
          headers: {
            Authorization: `Bearer ${tokenRef.current}`
          }
        }
      );

      setCaseStudies(response.data.case_studies || []);
    } catch (error) {
      console.error("Error fetching case studies:", error);
      toast.error("Failed to load case studies");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCaseStudies = caseStudies.filter(
    (study) =>
      study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      study.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Case Studies</h1>
          <p className="text-base text-muted-foreground">
            Browse and manage case studies to reference in your proposals.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-96">
            <div className="relative flex items-center w-full px-4 py-2 border border-typo-grey-6 rounded-lg bg-white">
              <Search className="absolute left-4 h-6 w-6 text-typo-700 z-10" />
              <Input
                className="w-full pl-9 border-none outline-none focus-visible:ring-0 shadow-none text-base md:text-base py-0 h-6"
                placeholder="Search case studies"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Button size="lg" className="px-4">
            <Plus className="text-white mr-2" />
            Add Case Study
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p>Loading case studies...</p>
          </div>
        ) : filteredCaseStudies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No case studies found</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              {searchQuery
                ? "No case studies match your search criteria. Try a different search term."
                : "You haven't added any case studies yet. Add your first case study to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* For now, we'll just display placeholder cards since we don't have actual case study data */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-full">
                <CardHeader>
                  <CardTitle>Sample Case Study {i}</CardTitle>
                  <CardDescription>Technology • 2023</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    euismod justo at velit tristique, in accumsan enim
                    tincidunt.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="outline">Healthcare</Badge>
                    <Badge variant="outline">Cloud Migration</Badge>
                    <Badge variant="outline">Security</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseStudies;
