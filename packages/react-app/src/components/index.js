import styled from "styled-components";

// Create a Title component that'll render an <h1> tag with some styles
export const Title = styled.h1`
  text-align: center;
  font-size: 2em;
  color: white;
  
`;

export const Body = styled.div`
  align-items: center;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: calc(10px + 2vmin);
  justify-content: center;
  margin-top: 10px;
`;

export const Text = styled.div`
  align-items: center;
  color: white;
  display: flex;
  flex-direction: column;
  font-size: calc(8px + 2vmin);
  justify-content: center;
  margin-top: 20px;
  margin-left: calc(0px + 2vmin);
  margin-right: calc(0px + 2vmin);
`;

export const Button = styled.button`
background: none;
color: white;
border-radius: 10px;
border: none;
padding: 10px;
margin: 20px;
font-size: 12px;
:disabled {
  opacity: 0.4;
}
:hover {
  box-shadow: 0 0 10px blue;
}
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const Container = styled.div`
  background-color: #282c34;
  display: flex;
  flex-direction: column;
  height: calc(100vh);
`;

export const Header = styled.header`
  align-items: center;
  background-color: #282c34;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  min-height: 70px;
`;

export const Image = styled.img`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

export const Link = styled.a.attrs({
  target: "_blank",
  rel: "noopener noreferrer",
})`
  color: #61dafb;
  margin-top: 8px;
`;

export const Input = styled.input`
  padding: 0.5em;
  margin: 0.5em;
  color: #BF4F74};
  background: white;
  border: none;
  border-radius: 3px;
`;
