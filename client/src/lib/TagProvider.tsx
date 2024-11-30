// TagProvider.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export interface Tag {
  id: string;
  title: string;
  explanation: string;
  tags: string[];
  type: "comment" | "blog" | "template";
}

interface TagContextType {
  tags: Tag[] | null;
  isLoading: boolean;
  fetchTags: () => Promise<void>;
}

const sampleTags: Tag[] = [
  {
    id: "1",
    title: "Centering a Div in CSS",
    explanation:
      "Techniques to center a div element horizontally and vertically using CSS.",
    tags: ["CSS", "HTML", "Web Design"],
    type: "blog",
  },
  {
    id: "2",
    title: "Understanding React useEffect",
    explanation:
      "An in-depth look at the useEffect hook and its usage in React.",
    tags: ["React", "Hooks", "JavaScript"],
    type: "template",
  },
  {
    id: "3",
    title: "Python List Comprehensions",
    explanation:
      "Guide to using list comprehensions for efficient loops in Python.",
    tags: ["Python", "Programming", "Efficiency"],
    type: "comment",
  },
];

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchTags = async () => {
    setIsLoading(true);
    try {
      //   const response = await axios.get('/api/tags');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTags(sampleTags);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <TagContext.Provider value={{ tags, isLoading, fetchTags }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTag = (): TagContextType => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTag must be used within a TagProvider");
  }
  return context;
};
