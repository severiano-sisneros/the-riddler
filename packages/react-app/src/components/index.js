import styled from "styled-components";

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
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 24px;
  margin: 15px;
  font-size: 1.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  
  :disabled {
    opacity: 0.4;
  }
  
  :hover {
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 15px rgba(147, 112, 219, 0.6);
    transform: translateY(-2px);
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const Container = styled.div`
  background: transparent;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

export const Header = styled.header`
  align-items: center;
  background: transparent;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  min-height: 70px;
  padding: 20px;
  position: fixed;
  top: 0;
  right: 0;
  z-index: 100;
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
  color: white;
  margin: 0 15px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9em;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-decoration: none;
  
  :hover {
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 15px rgba(147, 112, 219, 0.6);
    transform: translateY(-2px);
  }
`;

export const Input = styled.input`
  padding: 15px 25px;
  margin: 15px 0;
  color: white;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  font-family: 'Cinzel', serif;
  font-size: 1.1em;
  transition: all 0.3s ease;
  width: calc(100% - 50px);
  
  :focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 10px rgba(138, 43, 226, 0.4);
    background: rgba(255, 255, 255, 0.05);
  }
`;
