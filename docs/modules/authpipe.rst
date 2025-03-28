Authentication Pipeline
=======================

Views
~~~~~
.. automodule:: authpipe.views
    :members:

Utils
~~~~~
.. automodule:: authpipe.utils
    :members:

Additional notes
~~~~~~~~~~~~~~
### Associate Students Utility
The `authpipe.utils.associate_students` function is responsible for linking student accounts based on authentication details. As of March 2025, the authentication provider used was updated (Azure -> OIDC), and a significant part of this function was rewritten/refactored in the process.

`associate_students` is a custom function in the Social Auth pipeline specific to Semester.ly. The pipeline, with our custom functions included, is as follows:

.. code-block:: python

    SOCIAL_AUTH_PIPELINE = (
    # Get the information we can about the user and return it in a simple
    # format to create the user instance later. On some cases the details are
    # already part of the auth response from the provider, but sometimes this
    # could hit a provider API.
    "social_core.pipeline.social_auth.social_details",
    # Get the social uid from whichever service we're authing thru. The uid is
    # the unique identifier of the given user in the provider.
    "social_core.pipeline.social_auth.social_uid",
    # Verifies that the current auth process is valid within the current
    # project, this is where emails and domains whitelists are applied (if
    # defined).
    "social_core.pipeline.social_auth.auth_allowed",
    # Checks if the current social-account is already associated in the site.
    "social_core.pipeline.social_auth.social_user",
    # Make up a username for this person, appends a random string at the end if
    # there's any collision.
    "social_core.pipeline.user.get_username",
    # Our method to associate the current social details with another user account
    "authpipe.utils.associate_students",
    # Create a user account if we haven't found one yet.
    "social_core.pipeline.user.create_user",
    # Create the record that associated the social account with this user.
    "social_core.pipeline.social_auth.associate_user",
    # Populate the extra_data field in the social record with the values
    # specified by settings (and the default ones like access_token, etc).
    "social_core.pipeline.social_auth.load_extra_data",
    # Update the user record with any changed info from the auth service.
    "social_core.pipeline.user.user_details",
    # Our method to initialize the new student object.
    "authpipe.utils.create_student",
)

`associate_students` associates student logins to their Semester.ly accounts using the following methodology:
1. The user may have already been previously associated by a step earlier in the pipeline. We attempt to override this later in the `try_associate*` functions, but `kwargs["user"] = user` is still set as a backup for this reason, in case for some reason we cannot match the user within this function.
2. The function tries to match the email returned by the authentication provider to an email associated with a Semester.ly account via `try_associate_email`. Each `User` has an associated email address which is initialized depending on the method of sign-in (JHED login, Facebook, Google). If a `User` is successfully found in this step, the function effectively breaks and returns this `User`.
3. If a user cannot be found via email, `associate_students` will then attempt by `jhed` (specific to Hopkins students) via `try_associate_jhed_oidc`. If the authentication provider is not JHU-based, this secondary function will immediately fail and return nothing. Else, it will get the `jhed` from the authentication response, and look for a Semester.ly account with a matching `jhed` (recorded in the `Student` table). Similar to `try_associate_email`, if a `User` is successfully found in this step, the function effectively breaks and returns the found `User`.
4. If a user cannot be found via email or jhed, `try_associate_token` is used next, which has a very similar implementation as the previous two sub-functions.

After this process, if a `User` is still not found, a new one will be created later on in the pipeline. Note that even if none of the three above methods find a `User`, it could still have been found by a function earlier in the pipeline, such as `social_core.pipeline.social_auth.social_user`, which looks for an association by recognizing a familiar authentication provider.
