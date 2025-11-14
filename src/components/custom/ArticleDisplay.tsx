"use client";
import { X } from "lucide-react";
import React, { ReactNode, useCallback, useState } from "react";
import { getParsedDocument, HTMLNode } from "@/lib/html-parser";

interface ModalState {
  src: string;
  alt: string;
  isOpen: boolean;
}

interface CustomComponentProps {
  key: React.Key;
  children?: ReactNode;
  [key: string]: unknown;
}

interface CustomImageProps extends CustomComponentProps {
  src?: string;
  alt?: string;
  onImageClick: (src: string, alt: string) => void;
}

interface CustomHeadingProps extends CustomComponentProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

interface CustomListProps extends CustomComponentProps {
  ordered: boolean;
}

interface CustomLinkProps extends CustomComponentProps {
  href?: string;
}

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

// Custom components for different HTML elements
const CustomParagraph: React.FC<CustomComponentProps> = ({
  children,
  ...props
}) => (
  <p
    className="mb-4 max-w-[100vw] text-base font-normal leading-7 text-gray-800/75"
    {...props}
  >
    {children}
  </p>
);

const CustomHeading: React.FC<CustomHeadingProps> = ({
  level,
  children,

  ...props
}) => {
  const baseClasses = "font-bold mb-3";
  const levelClasses: Record<number, string> = {
    1: "text-3xl",
    2: "text-2xl",
    3: "text-xl",
    4: "text-lg",
    5: "text-base",
    6: "text-sm",
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={`${baseClasses} ${levelClasses[level]}`} {...props}>
      {children}
    </Tag>
  );
};

const CustomDiv: React.FC<CustomComponentProps> = ({
  children,

  ...props
}) => (
  <div className="mb-2" {...props}>
    {children}
  </div>
);

const CustomImage: React.FC<CustomImageProps> = ({
  src = "",
  alt = "Image",

  onImageClick,
  ...props
}) => (
  //   <img
  //     src={src}
  //     alt={alt}
  //     className="mb-4 h-auto max-w-full cursor-pointer rounded-lg shadow-md transition-shadow hover:shadow-lg"
  //     onClick={() => onImageClick(src, alt)}
  //     {...props}
  //   />
  <div
    onClick={() => onImageClick(src, alt)}
    className="group relative mb-4 max-h-[350px] max-w-full cursor-pointer overflow-hidden rounded-lg transition-all duration-300"
  >
    <img
      src={src}
      alt={alt}
      className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
      onClick={() => onImageClick(src, alt)}
      {...props}
    />

    {/* Overlay with expand icon */}
    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
      <div className="rounded-full bg-white/90 p-3 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-700"
        >
          <polyline points="15,3 21,3 21,9"></polyline>
          <polyline points="9,21 3,21 3,15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </div>
    </div>

    {/* Optional: Corner indicator */}
    <div className="absolute right-3 top-3 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
      <div className="rounded-full bg-black/50 p-1.5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15,3 21,3 21,9"></polyline>
          <polyline points="9,21 3,21 3,15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </div>
    </div>
  </div>
);

const CustomList: React.FC<CustomListProps> = ({
  ordered,
  children,

  ...props
}) => {
  const Tag = ordered ? "ol" : "ul";
  const listClass = ordered
    ? "list-decimal list-inside mb-4 space-y-1"
    : "list-disc list-inside mb-4 space-y-1";

  return (
    <Tag className={listClass} {...props}>
      {children}
    </Tag>
  );
};

const CustomListItem: React.FC<CustomComponentProps> = ({
  children,

  ...props
}) => (
  <li className="ml-4" {...props}>
    {children}
  </li>
);

const CustomLink: React.FC<CustomLinkProps> = ({
  href,
  children,

  ...props
}) => (
  <a
    href={href}
    className="text-blue-600 underline hover:text-blue-800"
    target="_blank"
    rel="noopener noreferrer"
    {...props}
  >
    {children}
  </a>
);

const CustomStrong: React.FC<CustomComponentProps> = ({
  children,

  ...props
}) => (
  <strong className="font-bold" {...props}>
    {children}
  </strong>
);

const CustomEm: React.FC<CustomComponentProps> = ({
  children,

  ...props
}) => (
  <em className="italic" {...props}>
    {children}
  </em>
);

const ImageModal: React.FC<ImageModalProps> = ({
  src,
  alt,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div className="relative max-h-full w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white transition-colors hover:text-gray-300"
        >
          <X size={24} />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-h-full w-full max-w-4xl rounded-lg object-contain"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

const parseHTMLToReact = (
  htmlString: string,
  onImageClick: (src: string, alt: string) => void
): ReactNode[] => {
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(htmlString, 'text/html');
  const doc = getParsedDocument(htmlString);

  const convertNodeToReact = (node: HTMLNode, index: number = 0): ReactNode => {
    if (node.type === "TEXT_NODE") {
      const text = node.content.replaceAll("&nbsp;", "");
      return text ? text : null;
    }

    if (node.type !== "V_NODE") {
      return null;
    }

    const element = node;
    const tagName = element.tagName.toLowerCase();
    const children = Array.from(element.children)
      .map((child, i) => convertNodeToReact(child, i))
      .filter((child): child is ReactNode => child !== null);

    // const props: Record<string, unknown> = {
    //   key: index,
    //   ...element.attributes,
    //   className: element.attributes["class"]?.trim(),
    //   //   ...Array.from(element.attributes).reduce((acc: Record<string, string>, attr) => {
    //   //     acc[attr.name] = attr.value;
    //   //     return acc;
    //   //   }, {})
    // };

    const props: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(element.attributes)) {
      if (key === "class" || key === "style") {
        continue;
      }
      props[key] = value;
    }

    switch (tagName) {
      case "p":
        return (
          <CustomParagraph {...props} key={index}>
            {children}
          </CustomParagraph>
        );
      case "h1":
        return (
          <CustomHeading key={index} level={1} {...props}>
            {children}
          </CustomHeading>
        );
      case "h2":
        return (
          <CustomHeading key={index} level={2} {...props}>
            {children}
          </CustomHeading>
        );
      case "h3":
        return (
          <CustomHeading key={index} level={3} {...props}>
            {children}
          </CustomHeading>
        );
      case "h4":
        return (
          <CustomHeading key={index} level={4} {...props}>
            {children}
          </CustomHeading>
        );
      case "h5":
        return (
          <CustomHeading key={index} level={5} {...props}>
            {children}
          </CustomHeading>
        );
      case "h6":
        return (
          <CustomHeading key={index} level={6} {...props}>
            {children}
          </CustomHeading>
        );
      case "div":
        return (
          <CustomDiv key={index} {...props}>
            {children}
          </CustomDiv>
        );
      case "img":
        return (
          <CustomImage
            {...props}
            key={index}
            src={props.src as string}
            alt={props.alt as string}
            onImageClick={onImageClick}
          />
        );
      case "ul":
        return (
          <CustomList key={index} ordered={false} {...props}>
            {children}
          </CustomList>
        );
      case "ol":
        return (
          <CustomList key={index} ordered={true} {...props}>
            {children}
          </CustomList>
        );
      case "li":
        return (
          <CustomListItem key={index} {...props}>
            {children}
          </CustomListItem>
        );
      case "a":
        return (
          <CustomLink key={index} {...props} href={props.href as string}>
            {children}
          </CustomLink>
        );
      case "strong":
      case "b":
        return (
          <CustomStrong key={index} {...props}>
            {children}
          </CustomStrong>
        );
      case "em":
      case "i":
        return (
          <CustomEm key={index} {...props}>
            {children}
          </CustomEm>
        );
      case "br":
        return <br key={index} />;
      case "span":
        return (
          <span key={index} {...props}>
            {children}
          </span>
        );
      case "hr":
        return <hr key={index} {...props} />;
      default:
        // For unknown tags, render them as-is using React.createElement
        return React.createElement(tagName, { key: index, ...props }, children);
    }
  };

  //   const bodyContent = doc.children;
  return doc.children
    .map((node, index) => convertNodeToReact(node, index))
    .filter((element): element is ReactNode => element !== null);
};

interface HTMLParserRendererProps {
  htmlString: string;
  //   onImageClick: (src: string, alt: string) => void;
}

// Main component
const HTMLParserRenderer: React.FC<HTMLParserRendererProps> = ({
  htmlString,
}) => {
  const [modalImage, setModalImage] = useState<ModalState>({
    src: "",
    alt: "",
    isOpen: false,
  });

  const handleImageClick = useCallback((src: string, alt: string): void => {
    setModalImage({ src, alt, isOpen: true });
  }, []);

  const closeModal = useCallback((): void => {
    setModalImage({ src: "", alt: "", isOpen: false });
  }, []);

  const renderedContent = parseHTMLToReact(htmlString, handleImageClick);

  return (
    <>
      {renderedContent}
      <ImageModal
        src={modalImage.src}
        alt={modalImage.alt}
        isOpen={modalImage.isOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default HTMLParserRenderer;
