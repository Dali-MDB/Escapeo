"use client"

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';


const PackageCard = (props) => {
  return (
    <StyledWrapper>
      <div
        className="card"
        style={{
          backgroundImage: `url(${props.backgroundImage})`,
          backgroundSize:'cover', // Ensures the image covers the entire card
          backgroundPosition: 'center', // Centers the background image
        }}
      >
        <div className="card-details">
          <p className="text-title">{props.title}</p>
          <p className="text-body">{props.description}</p>
        </div>
        <button className="card-button">
          <Link href={props.link}>More info</Link>
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    width: 190px;
    height: 254px;
    border-radius: 20px;
    position: relative;
  }

  .card-details {
    color: black;
    height: 100%;
    gap: 0.5em;
    display: grid;
    place-content: center;
    background: transparent; // Semi-transparent background for better readability
    padding: 10px;
  }

  .card-button {
    transform: translate(-50%, 125%);
    width: 60%;
    border-radius: 1rem;
    border: none;
    background-color: #008bf8;
    color: #fff;
    font-size: 1rem;
    padding: 0.5rem 1rem;
    position: absolute;
    left: 50%;
    bottom: 0;
    opacity: 0;
    transition: 0.3s ease-out;
  }

  .text-body {
    color: rgb(134, 134, 134);
  }

  /*Text*/
  .text-title {
    font-size: 1.5em;
    font-weight: bold;
  }

  /*Hover*/
  .card:hover {
    border-color: #008bf8;
    box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.25);
  
    border: 2px solid #008bf8;
    
    }

  .card:hover .card-button {
    transform: translate(-50%, 50%);
    opacity: 1;
  transition: 0.5s ease-out;
    
    }
`;

export default PackageCard;