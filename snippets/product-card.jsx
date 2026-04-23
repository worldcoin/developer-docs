import React from "react";

export const ProductCard = ({ title, description, href, icon }) => {
  return (
    <a
      href={href}
      className="product-card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        aspectRatio: "1 / 1",
        padding: "24px",
        borderRadius: "16px",
        textDecoration: "none",
        cursor: "pointer",
      }}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className="product-card-icon"
          style={{ width: "32px", height: "32px", display: "block" }}
        />
      )}
      <div>
        <div
          className="product-card-title"
          style={{
            fontSize: "24px",
            lineHeight: 1.3,
            letterSpacing: "-0.24px",
            fontWeight: 450,
          }}
        >
          {title}
        </div>
        <div
          className="product-card-desc"
          style={{
            fontSize: "16px",
            lineHeight: 1.4,
            fontWeight: 300,
            marginTop: "10px",
          }}
        >
          {description}
        </div>
      </div>
    </a>
  );
};

export default ProductCard;
