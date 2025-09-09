export interface IGoogleAuthRequestDTO {
  credential: string; 
}

export interface IGoogleAuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  name: string;

}
