import React from "react";

function Input(params: {
  placeholder?: string | undefined;
  className?: string | undefined;
  type?: string | undefined;
}) {
  return <input {...params} />;
}

export default Input;
