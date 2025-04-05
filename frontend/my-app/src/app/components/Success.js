 
 "use client";
import { useState } from "react";
import styled from "styled-components";

 
 export default function Success() { 
    return (
     <StyledWrapper>
    <div class="wrapper">
      <div class="toast success">
        <div class="container-1">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="container-2">
          <p>Success</p>
          <p>Your changes are saved successfully.</p>
        </div>
        <button>&times;</button>
      </div>
    </div>
    </StyledWrapper> 
 ) 
}


const StyledWrapper = styled.div`  
 * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
      }

      body {
        background-color: #f9f9f9;
      }

      .wrapper {
        width: 380px;
        position: absolute;
        top: 1%;
        right: 0;
      }

      .toast {
        width: 100%;
        height: 80px;
        padding: 20px;
        background-color: #ffffff;
        border-radius: 7px;
        display: grid;
        grid-template-columns: 1.3fr 6fr 0.5fr;
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
      }

      .success {
        border-left: 8px solid #47f764;
      }

      .success i {
        color: #47f764;
      }

      .container-1 i {
        font-size: 35px;
      }

      .container-1,
      .container-2 {
        align-self: center;
      }

      .container-2 p:first-child {
        font-size: 16px;
        color: #101020;
        font-weight: 600;
      }

      .container-2 p:last-child {
        font-size: 12px;
        font-weight: 400;
        color: #656565;
      }

      .toast button {
        align-self: flex-start;
        background-color: transparent;
        border: none;
        font-size: 25px;
        line-height: 0;
        cursor: pointer;
        color: #656565;
      }`;
{/**
    <style>
   
    </style>
 */}