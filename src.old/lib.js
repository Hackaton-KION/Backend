export const extractAccessToken = (header) => {
	return header.split(' ')[1];
};
