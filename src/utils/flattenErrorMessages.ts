export default function flattenErrorMessages(errors: any) {
  if (typeof errors.details === "string") {
    return errors.details;
  } else if (typeof errors.details === "object") {
    const messages = Object.values(errors.details)
      .flat()
      .filter((message) => typeof message === "string")
      .join(" ");
    return messages;
  } else {
    return errors.error || "An error occured";
  }
}
