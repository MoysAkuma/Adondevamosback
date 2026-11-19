import exceptions from '../middleware/exceptions.middleware.js';

class usersRepository {
  constructor({ userClient }) {
    this.userClient = userClient;
  }

  async getUserById(userId, fields = "name, lastname, email, tag") {
    const { data, error } = await this.userClient
      .from('users')
      .select(fields)
      .eq('id', userId);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getUserByEmail(email) {
    const { data, error } = await this.userClient
      .from('users')
      .select("id, name, tag, password, profile_photo")
      .ilike('email', email);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getPasswordByEmail(email) {
    const { data, error } = await this.userClient
      .from('users')
      .select("password")
      .ilike('email', email);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getUsersByField(field, value,
    fields = "id, name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide") {
    const normalizedField = field.toLowerCase();

    const { data, error } = await this.userClient
      .from('users')
      .select(fields)
      .eq(normalizedField, value);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async createUser(CreateUserRq) {
    const { data, error } = await this.userClient
      .from('users')
      .insert(
        {
          name: CreateUserRq.name,
          tag: CreateUserRq.tag,
          lastname: CreateUserRq.lastname,
          secondname: CreateUserRq.secondname,
          password: CreateUserRq.password,
          countryid: CreateUserRq.countryid,
          stateid: CreateUserRq.stateid,
          cityid: CreateUserRq.cityid,
          description: CreateUserRq.description,
          email: CreateUserRq.email,
          enabled: true,
          hide: false
        })
      .select();

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async updateUser(userId, UpdateUserRq) {
    // Build update object with only provided fields
    const updateData = {};
    if (UpdateUserRq.name !== undefined) updateData.name = UpdateUserRq.name;
    if (UpdateUserRq.lastname !== undefined) updateData.lastname = UpdateUserRq.lastname;
    if (UpdateUserRq.secondname !== undefined) updateData.secondname = UpdateUserRq.secondname;
    if (UpdateUserRq.countryid !== undefined) updateData.countryid = UpdateUserRq.countryid;
    if (UpdateUserRq.stateid !== undefined) updateData.stateid = UpdateUserRq.stateid;
    if (UpdateUserRq.cityid !== undefined) updateData.cityid = UpdateUserRq.cityid;
    if (UpdateUserRq.description !== undefined) updateData.description = UpdateUserRq.description;

    if (UpdateUserRq.tag !== undefined) updateData.tag = UpdateUserRq.tag;
    if (UpdateUserRq.password !== undefined) updateData.password = UpdateUserRq.password;
    if (UpdateUserRq.email !== undefined) updateData.email = UpdateUserRq.email;

    const { data, error } = await this.userClient
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async searchUsersByField(field, value) {
    const normalizedField = field.toLowerCase();
    const normalizedValue = `%${value.toLowerCase()}%`;
    const { data, error } = await this.userClient
      .from('users')
      .select("id, name, lastname, email, tag, description, countryid, stateid, cityid, enabled, hide")
      .ilike(normalizedField, normalizedValue)
      .limit(5);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getUserByTag(tagid) {
    const { data, error } = await this.userClient
      .from('users')
      .select("id, email, name, lastname, tagid, password")
      .eq('tagid', tagid);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async checkAdminRole(userId) {
    const { data, error } = await this.userClient
      .from('admins')
      .select()
      .eq('userid', userId)
      .eq('enabled', true);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async searchByEmailAndPassword(email, password) {
    const { data, error } = await this.userClient
      .from('users')
      .select("id,name, tag, lastname")
      .ilike('email', email)
      .eq('password', password)
      .limit(1);

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  async searchByTagAndPassword(tag, password) {
    const { data, error } = await this.userClient
      .from('users')
      .select("id, name, tag, lastname")
      .eq('tag', tag)
      .eq('password', password)
      .limit(1);

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  async searchByText(text) {
    const { data, error } = await this.userClient
      .from('users')
      .select("id, name, email, tag, email")
      .or(`tag.ilike.%${text}%, email.ilike.%${text}%`)
      .limit(5);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async checkEmailExists(email) {
    const { data, error } = await this.userClient
      .from('users')
      .select("id")
      .ilike('email', email);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async checkTagExists(tag) {
    const { data, error } = await this.userClient
      .from('users')
      .select("id")
      .eq('tag', tag);

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async searchByEmail(email,
    fields = "id, name, tag, lastname, password") {
    const { data, error } = await this.userClient
      .from('users')
      .select(fields)
      .ilike('email', email)
      .limit(1);

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  async searchByTag(tag,
    fields = "id, name, tag, lastname, password") {
    const { data, error } = await this.userClient
      .from('users')
      .select(fields)
      .eq('tag', tag)
      .limit(1);

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  async searchOwnerInfo(userid, fields = "id, name, tag, email") {
    //avoid duplicate user ids
    const uniqueuserids = [...new Set(userid)];

    //get user list
    const { data, error } = await this.userClient
      .from('users')
      .select(fields)
      .in('id', uniqueuserids);

    if (error) throw exceptions.internal(error.message);
    return data ?? [];
  }

  async createEmailConfirmation(userId, email, expiration) {
    const { data, error } = await this.userClient
      .from('confirmations')
      .insert({
        userid: userId,
        email: email,
        expiration: expiration,
        confirmed: false
      })
      .select('token, expiration')
      .single();

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async verifyEmailConfirmationToken(token) {
    const { data, error } = await this.userClient
      .from('confirmations')
      .select('userid, expiration, confirmed')
      .eq('token', token)
      .maybeSingle();

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async confirmEmail(token) {
    const { data, error } = await this.userClient
      .from('confirmations')
      .update({ confirmed: true })
      .eq('token', token)
      .select()
      .single();

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  /**
   * Uploads already-processed images to storage and returns their public URLs.
   * A thumbnail upload failure is logged but does not fail the operation.
   */
  async uploadProfilePhotoToStorage(avatarFileName, avatarBuffer, thumbnailFileName, thumbnailBuffer) {
    const bucketName = 'adondevamosNoGallery';

    const { error: avatarError } = await this.userClient.storage
      .from(bucketName)
      .upload(avatarFileName, avatarBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });

    if (avatarError) throw exceptions.internal(avatarError.message);

    const { error: thumbnailError } = await this.userClient.storage
      .from(bucketName)
      .upload(thumbnailFileName, thumbnailBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });

    if (thumbnailError) {
      console.error(`Failed to upload thumbnail ${thumbnailFileName}:`, thumbnailError.message);
    }

    const { data: avatarUrlData } = this.userClient.storage
      .from(bucketName)
      .getPublicUrl(avatarFileName);

    const { data: thumbnailUrlData } = this.userClient.storage
      .from(bucketName)
      .getPublicUrl(thumbnailFileName);

    return {
      avatarUrl: avatarUrlData.publicUrl,
      thumbnailUrl: thumbnailUrlData.publicUrl
    };
  }

  async updateProfilePhotoUrls(userId, avatarUrl, thumbnailUrl) {
    const { data, error } = await this.userClient
      .from('users')
      .update({
        profile_photo: avatarUrl,
        profile_photo_tn: thumbnailUrl
      })
      .eq('id', userId)
      .select('id, profile_photo, profile_photo_tn');

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  async getFriendRequestById(friendRequestId) {
    const { data, error } = await this.userClient
      .from('friends')
      .select('id, sender_id, addressed_id, status')
      .eq('id', friendRequestId)
      .maybeSingle();

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async saveFriendRequest(senderId, addressedId) {
    const { data, error } = await this.userClient
      .from('friends')
      .insert({
        sender_id: senderId,
        addressed_id: addressedId,
        status: 'pending'
      })
      .select('id, sender_id, addressed_id, status');

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  async changeFriendRequestStatus(friendRequestId, status) {
    const { data, error } = await this.userClient
      .from('friends')
      .update({
        status: status
      })
      .eq('id', friendRequestId)
      .select('id');

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async getInvitationById(invitationId) {
    const { data, error } = await this.userClient
      .from('invitations')
      .select('id, sender_id, email, status')
      .eq('id', invitationId)
      .maybeSingle();

    if (error) throw exceptions.internal(error.message);
    return data;
  }

  async saveInvitation(senderId, email) {
    const { data, error } = await this.userClient
      .from('invitations')
      .insert({
        sender_id: senderId,
        email: email,
        status: 'pending'
      })
      .select('id, sender_id, email, status');

    if (error) throw exceptions.internal(error.message);
    return data?.[0] ?? null;
  }

  async changeInvitationStatus(invitationId, status) {
    const { data, error } = await this.userClient
      .from('invitations')
      .update({
        status: status
      })
      .eq('id', invitationId)
      .select('id');

    if (error) throw exceptions.internal(error.message);
    return data;
  }
};

export default usersRepository;
