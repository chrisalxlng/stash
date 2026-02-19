export type FileMetadata = {
	fileId: string;
	originalName: string;
	mimetype: string;
	uploadedAt: string;
	allowTokenAccess: boolean;
	expiresAt?: string | null;
};
