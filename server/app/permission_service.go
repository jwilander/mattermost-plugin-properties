package app

import (
	"github.com/jwilander/mattermost-plugin-properties/server/config"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/pkg/errors"
)

// ErrNoPermissions if the error is caused by the user not having permissions
var ErrNoPermissions = errors.New("does not have permissions")

// ErrLicensedFeature if the error is caused by the server not having the needed license for the feature
var ErrLicensedFeature = errors.New("not covered by current server license")

type LicenseChecker interface {
}

type PermissionsService struct {
	propertyService      PropertyService
	propertyFieldService PropertyFieldService
	pluginAPI            *pluginapi.Client
	configService        config.Service
}

func NewPermissionsService(
	propertyService PropertyService,
	propertyFieldService PropertyFieldService,
	pluginAPI *pluginapi.Client,
	configService config.Service,
) *PermissionsService {
	return &PermissionsService{
		propertyService,
		propertyFieldService,
		pluginAPI,
		configService,
	}
}

func (p *PermissionsService) PropertyCreate(userID string, property Property) error {
	if property.ObjectType == PropertyObjectTypePost {
		post, err := p.pluginAPI.Post.GetPost(property.ObjectID)
		if err != nil {
			return errors.Wrap(err, "invalid post")
		}
		//TODO: implement config-based permission check for editing someone else's post
		if !p.pluginAPI.User.HasPermissionToChannel(userID, post.ChannelId, model.PermissionCreatePost) {
			return errors.Errorf("user `%s` does not have permission to create posts in channel `%s`", userID, post.ChannelId)
		}
	} else if property.ObjectType == PropertyObjectTypeChannel {
		channel, err := p.pluginAPI.Channel.Get(property.ObjectID)
		if err != nil {
			return errors.Wrap(err, "invalid channel")
		}
		if channel.Type == model.ChannelTypeOpen &&
			!p.pluginAPI.User.HasPermissionToChannel(userID, property.ObjectID, model.PermissionManagePublicChannelProperties) {
			return errors.Errorf("user `%s` does not have permission to manage public channel properties`%s`", userID, channel.Id)
		} else if channel.Type == model.ChannelTypePrivate &&
			!p.pluginAPI.User.HasPermissionToChannel(userID, property.ObjectID, model.PermissionManagePrivateChannelProperties) {
			return errors.Errorf("user `%s` does not have permission to manage private channel properties`%s`", userID, channel.Id)
		} else {
			return errors.New("permission check for dms/gms not implemented")
		}
	} else {
		return errors.Errorf("permission checks only implemented for `%s` and `%s`", PropertyObjectTypePost, PropertyObjectTypeChannel)
	}

	return nil
}

// IsSystemAdmin returns true if the userID is a system admin
func IsSystemAdmin(userID string, pluginAPI *pluginapi.Client) bool {
	return pluginAPI.User.HasPermissionTo(userID, model.PermissionManageSystem)
}

// RequesterInfo holds the userID and teamID that this request is regarding, and permissions
// for the user making the request
type RequesterInfo struct {
	UserID  string
	TeamID  string
	IsAdmin bool
	IsGuest bool
}

// IsGuest returns true if the userID is a system guest
func IsGuest(userID string, pluginAPI *pluginapi.Client) (bool, error) {
	user, err := pluginAPI.User.Get(userID)
	if err != nil {
		return false, errors.Wrapf(err, "Unable to get user to determine permissions, user id `%s`", userID)
	}

	return user.IsGuest(), nil
}

func GetRequesterInfo(userID string, pluginAPI *pluginapi.Client) (RequesterInfo, error) {
	isAdmin := IsSystemAdmin(userID, pluginAPI)

	isGuest, err := IsGuest(userID, pluginAPI)
	if err != nil {
		return RequesterInfo{}, err
	}

	return RequesterInfo{
		UserID:  userID,
		IsAdmin: isAdmin,
		IsGuest: isGuest,
	}, nil
}
